# jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-2-scandimerge-new-seed1

## Resumen

El modelo `jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-2-scandimerge-new-seed1` es un adaptador LoRA de 0,2 GB publicado por el usuario jekunz sobre `jekunz/new_scandimerge_2_135`, que a su vez parte de SmolLM2-135M-Instruct. El objetivo es transferir conocimiento de un merge TIES (pesos iguales) de modelos ajustados en danés e islandés hacia el feroés, idioma de bajos recursos, usando el subconjunto feroés de FineWeb-2. Se trata de un experimento de investigación, no de un modelo listo para producción.

La relevancia radica en la técnica: en lugar de entrenar un modelo feroés desde cero, se aprovecha el parentesco lingüístico germánico-nórdico mediante un merge intermedio y un ajuste LoRA posterior. El adaptador tiene rango 256 y alpha 512, apuntando a las proyecciones `up_proj`, `down_proj`, `gate_proj` y `o_proj`, con un entrenamiento de 1 época por idioma fuente y 5 épocas en feroés.

Es un artefacto de nicho: cero descargas, cero likes, sin evaluación amplia publicada y con la model card limitada a hiperparámetros de entrenamiento. Su interés es metodológico (transferencia cross-lingüe en modelos pequeños) más que práctico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-135M-Instruct) con adaptador LoRA |
| Parametros totales | 135M en el modelo base; el adaptador LoRA no reporta recuento propio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors del adaptador; no se publican GGUF) |
| Idiomas soportados | feroés (fo) como objetivo; base entrenada originalmente en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | 256 |
| Alpha LoRA | 512 |
| Modulos objetivo | up_proj, down_proj, gate_proj, o_proj |
| Modelo base | jekunz/new_scandimerge_2_135 |
| Dataset | HuggingFaceFW/fineweb-2 (porciones danesa, islandesa y feroesa) |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

El modelo base es SmolLM2-135M-Instruct, un transformer decoder-only de 135M parámetros. Sobre él se aplicó primero un merge TIES con pesos iguales de dos modelos entrenados en las porciones danesa e islandesa de FineWeb-2, dando lugar a `jekunz/new_scandimerge_2_135`. Después se entrenó un adaptador LoRA sobre la porción feroesa del mismo corpus.

El entrenamiento LoRA usó rango 256, alpha 512, learning rate 8e-4 con scheduler coseno y warmup ratio 0,05. Se realizaron 1 época por idioma fuente y 5 épocas en feroés, con batch size 8, acumulación de gradientes de 32 pasos (batch efectivo 256) y longitud máxima de 2048 tokens. Todo se ejecutó en una única A100 de 40 GB. La semilla es la 1 de tres configuraciones paralelas. No se documenta el número total de tokens vistos, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; la model card solo indica que es un ajuste supervisado sobre FineWeb-2.

## Capacidades

- Generación de texto conversacional en feroés, heredada de la pipeline `text-generation` y del formato instruct del modelo base.
- Transferencia cross-lingüe desde danés e islandés hacia feroés mediante merge TIES y LoRA.
- Razonamiento y código básicos heredados de SmolLM2-135M-Instruct, aunque no evaluados en feroés.
- Soporte de tool calling: no documentado en la model card; no disponible.
- Soporte de agentes y multi-step reasoning: no documentado; no disponible.
- Capacidades multilingües: limitadas al feroés como idioma declarado; el resto de idiomas no está evaluado.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación en transferencia cross-lingüe: servir como punto de comparación entre las tres semillas (seed 1, 2 y 3) para medir varianza en el ajuste LoRA sobre feroés.
- Generación de texto sintético en feroés para aumentar corpus de entrenamiento de modelos mayores, dado el bajo coste de inferencia de un modelo de 135M.
- Experimentos de destilación: usar las salidas del adaptador como profesor blando en tareas feroesas para modelos más grandes.
- Evaluación de merges TIES: comparar el rendimiento del merge danés-islandés frente a entrenar directamente en feroés sin transferencia.
- Prototipado de asistentes conversacionales en feroés con presupuesto de hardware mínimo (cabe en GPUs consumer).
- Estudio de olvido catastrófico: analizar cuánto inglés y danés retiene el adaptador tras 5 épocas en feroés, útil para diseñar estrategias de regularización.
- Base para fine-tuning posterior en dominios específicos feroeses (legal, sanitario) con LoRA de bajo rango.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el modelo "has not been evaluated more broadly yet".

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador pesa 0,2 GB y el base 135M en fp16 ocupa aproximadamente 270 MB; en fp32 unos 540 MB. Con overhead de runtime, menos de 2 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; una RTX 3060, RTX 4060 o incluso iGPU reciente es suficiente.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas de los últimos 8 años.
- Opciones de despliegue: transformers con PEFT (carga del adaptador sobre el base), vLLM (con soporte LoRA), llama.cpp/Ollama solo si se convierte el adaptador a GGUF, TGI con adaptadores.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera alta velocidad en GPU consumer, pero no hay cifras publicadas.
- Entrenamiento original: 1× A100 40 GB, batch efectivo 256, contexto 2048.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Evaluación publicada |
|---|---|---|---|---|---|
| jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-2-scandimerge-new-seed1 | 135M + LoRA | 2048 | fo | Apache 2.0 | No |
| SmolLM2-135M-Instruct (HuggingFaceTB) | 135M | 8192 (según model card oficial) | en (principalmente) | Apache 2.0 | Sí, benchmarks oficiales |
| Modelos feroeses dedicados (p. ej. variantes de GPT-2 small o BERT feroés) | variable | variable | fo | variable | Limitada |
| Modelos nórdicos multilingües (p. ej. familia NorBERT/ScandiBERT) | variable | 512-2048 | da, no, sv, is | variable | Parcial |

La comparación directa con alternativas feroesas es difícil porque no hay benchmarks comunes publicados para este adaptador. Frente a SmolLM2-135M-Instruct, la diferencia clave es el ajuste en feroés, pero el contexto efectivo baja a 2048 tokens por la configuración de entrenamiento.

## Limitaciones y advertencias

- Modelo de investigación sin evaluación amplia: la model card lo declara explícitamente; no debe usarse en producción sin validación propia.
- Riesgo de alucinación elevado por el tamaño (135M) y por el ajuste en un corpus web (FineWeb-2) sin filtrado específico documentado.
- Sesgos: no documentados; el corpus FineWeb-2 puede contener sesgos de género, geográficos y culturales no mitigados.
- Contexto limitado a 2048 tokens en entrenamiento; no se garantiza buen comportamiento más allá.
- Idioma: solo feroés declarado; el rendimiento en danés, islandés o inglés tras el ajuste no está medido y puede haberse degradado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el merge intermedio deben verificarse por separado; este adaptador hereda la licencia del base según la model card.
- Sin datos de benchmarks, sin métricas de perplejidad ni de calidad de generación en feroés.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria.
- El adaptador requiere cargar el modelo base `jekunz/new_scandimerge_2_135`, que a su vez depende de SmolLM2-135M-Instruct; la cadena de dependencias añade complejidad de despliegue.
- Fecha de creación indicada como 2026-11-18: verificar que la metadata sea correcta antes de citar el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-2-scandimerge-new-seed1
- Modelo base intermedio: https://huggingface.co/jekunz/new_scandimerge_2_135
- Modelo base original (SmolLM2-135M-Instruct): https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Paper SmolLM2: no disponible en la información proporcionada
- Blog o demo del autor: no disponible en la información proporcionada
