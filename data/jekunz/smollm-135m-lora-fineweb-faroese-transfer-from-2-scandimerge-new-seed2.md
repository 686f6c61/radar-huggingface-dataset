# jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-2-scandimerge-new-seed2

## Resumen

El modelo `jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-2-scandimerge-new-seed2` es un adaptador LoRA entrenado sobre el modelo base `jekunz/new_scandimerge_2_135`, que a su vez parte de SmolLM2-135M-Instruct. Está desarrollado por el usuario jekunz como parte de una investigación personal sobre transferencia lingüística entre lenguas nórdicas, en este caso aplicando el conocimiento adquirido en danés e islandés a la generación de texto en feroés. El objetivo es evaluar si un modelo pequeño con adaptadores de bajo rango puede adquirir competencia en un idioma de bajos recursos como el feroés partiendo de un merge de modelos entrenados en lenguas emparentadas.

El modelo base es un transformer de 135 millones de parámetros con una ventana de contexto de 2048 tokens durante el entrenamiento del adaptador. Este adaptador concreto corresponde a uno de tres seeds (seed 2) de una misma configuración, y se ha entrenado sobre la porción feroesa del dataset FineWeb-2. El resultado es un adaptador de aproximadamente 0,2 GB de tamaño en formato safetensors, con licencia Apache 2.0.

Es relevante porque explora una estrategia de bajo coste computacional (una única A100 de 40 GB, batch efectivo de 256) para la adaptación a lenguas de bajos recursos mediante transferencia desde lenguas relacionadas, un enfoque útil para investigadores que trabajan con idiomas escandinavos minoritarios y con recursos limitados. El autor indica explícitamente que el modelo es de uso para su investigación y que no ha sido evaluado de forma amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-135M-Instruct) con adaptador LoRA |
| Parametros totales | 135M (modelo base); adaptador LoRA de rango 256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (máximo usado en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Feroés (fo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 135 millones de parámetros (SmolLM2-135M-Instruct). Sobre él se aplicó un merge TIES con pesos iguales de modelos entrenados en las porciones danesa e islandesa de FineWeb-2, dando lugar al modelo base intermedio `jekunz/new_scandimerge_2_135`. Sobre ese merge se entrenó el adaptador LoRA objeto de esta ficha, usando la porción feroesa de HuggingFaceFW/fineweb-2. El adaptador tiene rango 256, alpha 512 y se aplica a los módulos `up_proj`, `down_proj`, `gate_proj` y `o_proj`.

El entrenamiento se realizó durante 1 época por cada idioma fuente y 5 épocas sobre el feroés, con learning rate 8e-4, scheduler coseno, warmup ratio 0,05, batch size 8, acumulación de gradientes de 32 pasos (batch efectivo 256) y una única GPU A100 de 40 GB. La longitud máxima de contexto fue de 2048 tokens y se usó la seed 2 de tres semillas disponibles para esta configuración. No se especifican el número exacto de tokens de entrenamiento ni si hubo fases de RLHF o DPO adicionales.

## Capacidades

- Generación de texto conversacional en feroés, heredada de la pipeline de text-generation y del modelo instruct base.
- Transferencia lingüística desde danés e islandés hacia feroés mediante el merge TIES previo al ajuste LoRA.
- Conversación multi-turno (el modelo base es de tipo instruct).
- Capacidad de razonamiento y código limitada por el tamaño del modelo base (135M), no verificada en este adaptador.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al feroés según la etiqueta de idioma; no se documenta comportamiento en otros idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación sobre transferencia entre lenguas nórdicas: el adaptador permite estudiar cuánto conocimiento del danés y el islandés se transfiere al feroés con un presupuesto de cómputo mínimo (una A100 de 40 GB), sirviendo como punto de comparación frente a las otras seeds.
- Generación de texto sintético en feroés para aumento de datos: puede emplearse para producir corpus adicionales que alimenten posteriores entrenamientos o evaluaciones de modelos mayores en este idioma de bajos recursos.
- Prototipado de asistentes conversacionales en feroés: al ser un modelo instruct de 135M, cabe en hardware modesto y permite validar rápidamente flujos de chat antes de escalar a modelos mayores.
- Evaluación de estrategias de merge (TIES) frente a ajuste directo: el modelo sirve como artefacto experimental para comparar si el merge previo mejora la adaptación al feroés respecto a partir solo de SmolLM2-135M-Instruct.
- Reproducibilidad de experimentos con seeds: al existir tres seeds con la misma configuración, permite medir la varianza del entrenamiento y estudiar la estabilidad del ajuste LoRA en lenguas de bajos recursos.
- Educación y demostraciones: útil en entornos docentes para ilustrar cómo se entrena un adaptador LoRA sobre un modelo pequeño y cómo se evalúa la transferencia lingüística con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 135M parámetros en precisión completa (fp16) el modelo base ocupa aproximadamente 0,27 GB, y en cuantización de 8 bits o 4 bits sería aún menor, pero no se documentan cuantizaciones para este adaptador.
- GPU recomendadas: el entrenamiento se realizó en una A100 de 40 GB; para inferencia basta con GPUs consumer de gama baja, aunque no se especifica un modelo concreto.
- Cabe en GPU consumer: sí, por el tamaño del modelo base (135M), aunque no se aportan mediciones.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base `jekunz/new_scandimerge_2_135` junto con el adaptador mediante la librería `peft`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-2-scandimerge-new-seed2) | 135M (base) + LoRA r256 | 2048 | Feroés | Apache 2.0 | Hugging Face (PEFT) |
| SmolLM2-135M-Instruct | 135M | no disponible en esta ficha | Multilingüe (inglés principalmente) | Apache 2.0 | Hugging Face |
| jekunz/new_scandimerge_2_135 | 135M | no disponible en esta ficha | Danés e islandés (merge) | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor indica que el modelo es para su investigación y que no ha sido evaluado de forma amplia; no debe asumirse calidad de producción.
- Riesgo de alucinación elevado por el tamaño reducido del modelo base (135M) y por el ajuste sobre datos web.
- Cobertura lingüística limitada al feroés; no se documenta comportamiento fiable en otros idiomas.
- Ventana de contexto de 2048 tokens, insuficiente para tareas que requieran contexto largo.
- No se documentan sesgos específicos, pero al entrenarse sobre FineWeb-2 puede heredar sesgos de los datos web.
- Licencia Apache 2.0 permite uso comercial, pero el adaptador depende del modelo base `jekunz/new_scandimerge_2_135`, cuya licencia y condiciones deben verificarse por separado.
- Al ser un adaptador PEFT, no es un modelo autónomo: requiere cargar el base junto con el adaptador y la librería `peft`.
- Sin métricas publicadas, no es posible estimar su calidad real frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-2-scandimerge-new-seed2
- Modelo base: https://huggingface.co/jekunz/new_scandimerge_2_135
- Dataset: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
