# mseo3/klear8b-planfmt-sftg-v3orth-mixctx1-b36-brewster-s100

## Resumen

Klear8b-planfmt-sftg-v3orth-mixctx1-b36-brewster-s100 es un ajuste fino supervisado (SFT) del modelo Klear-Reasoner-8B-SFT, desarrollado por el usuario mseo3. Se trata de un checkpoint intermedio (paso 100 de 1500) de un experimento de investigación centrado en la introducción de tokens especiales de planificación (`<|plan|>` y `<|/plan|>`) para estructurar el razonamiento del modelo en formato de plan explícito. El modelo parte de la familia Qwen3, según los tags de Hugging Face, y cuenta con 8.190.735.360 parámetros en formato bf16.

El interés de esta ficha es limitado desde el punto de vista de producción: es un checkpoint de investigación con cero descargas y cero likes, sin model card descriptiva de capacidades, sin benchmarks publicados y con un pipeline no definido. Resulta relevante únicamente como artefacto reproducible de un experimento concreto de formato de planificación y enmascaramiento de pérdida sobre pasos fallidos.

La receta de entrenamiento incluye detalles técnicos poco habituales: inicialización ortogonal de las filas del `lm_head` correspondientes a los nuevos tokens respecto a sus piezas de texto, enmascaramiento de pasos fallidos en la pérdida, y mezcla de filas revisadas y originales del mismo problema (estas últimas solo como contexto). El entrenamiento se realizó sobre 4 GPU H200 con FlashAttention 3 y batch global de 36.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, según tags); detalles internos no disponibles |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde shards FSDP) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint Kwai-Klear/Klear-Reasoner-8B-SFT, que a su vez pertenece a la familia Qwen3 según los tags del repositorio. La arquitectura subyacente es un transformer decoder-only de aproximadamente 8.190 millones de parámetros. El autor no documenta en la model card la composición del corpus original del modelo base ni el número total de tokens vistos durante el preentrenamiento.

El ajuste fino introduce dos tokens especiales nuevos: `<|plan|>` (id 151669) y `<|/plan|>` (id 151670), añadidos de forma no atada (untied) y con las filas correspondientes del `lm_head` reinicializadas de forma ortogonal a sus piezas de texto. Los datos provienen del dataset privado `mseo3/klear8b-planfmt-revmask-sft`, concretamente de `data/mixctx_v1`, con 58.446 filas que combinan filas revisadas (con los pasos fallidos enmascarados de la pérdida) y filas originales de los mismos problemas (con los pasos que fallan en la ronda 0 enmascarados y leídas solo como contexto). El entrenamiento usa batch global 36, learning rate 2e-5 con decaimiento coseno hasta 1e-5 durante 1500 pasos, warmup de 30 pasos, arranque desde el modelo base (fresh start), FlashAttention 3 y 4 GPU H200. Este checkpoint corresponde al paso 100. Los pesos se fusionaron desde los shards FSDP a bf16.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Klear-Reasoner-8B-SFT, orientado a tareas de razonamiento.
- Formato de planificación estructurada: el ajuste entrena al modelo a emitir bloques delimitados por `<|plan|>` y `<|/plan|>`, presumiblemente para separar la planificación del razonamiento o de la respuesta final.
- Razonamiento multi-paso: el enmascaramiento de pasos fallidos en la pérdida sugiere un entrenamiento orientado a cadenas de razonamiento con pasos verificables.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el autor no documenta idiomas.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre formatos de planificación en LLM: el modelo sirve como artefacto reproducible para estudiar cómo la introducción de tokens delimitadores de plan afecta a la estructura del razonamiento generado, comparándolo con el modelo base sin esos tokens.
- Reproducción de experimentos de enmascaramiento de pérdida: permite analizar el efecto de enmascarar pasos fallidos en la pérdida sobre la calidad de las cadenas de razonamiento, dado que la receta está documentada en la model card.
- Estudio de inicialización ortogonal de embeddings: el checkpoint permite evaluar empíricamente la estrategia de reinicializar filas del `lm_head` de forma ortogonal a sus piezas de texto para tokens nuevos.
- Base para ajustes posteriores en dominios con pasos verificables: al estar entrenado con pasos fallidos enmascarados, puede servir de punto de partida para tareas donde exista una verificación automática de pasos intermedios (por ejemplo, matemáticas o ejecución de código).
- Evaluación comparativa de checkpoints intermedios: al ser el paso 100 de 1500, es útil para trazar curvas de aprendizaje y decidir si continuar el entrenamiento.
- Docencia y divulgación técnica: como ejemplo didáctico de receta SFT completa (tokens nuevos, máscaras de pérdida, FSDP, FlashAttention 3) con hiperparámetros documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB para pesos (estimación a partir del tamaño, no confirmada por el autor).
- VRAM estimada en cuantización de 4 bits: alrededor de 4-5 GB para pesos (estimación a partir del tamaño, no confirmada por el autor).
- GPU recomendadas: H100 o H200 para entrenamiento e inferencia de alta concurrencia (el autor entrenó con 4x H200); A100 80 GB para inferencia en bf16 con contexto largo.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama tras conversión a GGUF; el formato publicado es safetensors en bf16. Los tokens especiales nuevos requieren configuración explícita del tokenizer en el servidor de inferencia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| klear8b-planfmt-sftg-v3orth-mixctx1-b36-brewster-s100 | 8,19 B | no disponible | apache-2.0 | Hugging Face, 0 descargas | Checkpoint de investigación, paso 100/1500 |
| Kwai-Klear/Klear-Reasoner-8B-SFT | ~8 B (no confirmado) | no disponible | no disponible | Hugging Face (modelo base) | Modelo base del que parte este ajuste |
| Qwen3-8B | ~8 B (familia Qwen3) | no disponible | no disponible | Hugging Face | Familia de la que procede el modelo base según tags |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 100 de 1500, por lo que no representa el resultado final de la receta y su calidad puede ser inferior a la de checkpoints posteriores.
- Sin benchmarks ni evaluación publicada: no hay evidencia documentada de rendimiento en tareas estándar.
- Sin model card de capacidades: el autor no documenta idiomas, contexto, casos de uso ni limitaciones del modelo.
- Dataset de entrenamiento privado: no es posible auditar la composición, procedencia ni licencias de los datos de `mseo3/klear8b-planfmt-revmask-sft`.
- Riesgo de alucinación: inherente a los modelos de razonamiento de esta escala; no cuantificado por el autor.
- Sesgos: no documentados; al desconocerse el corpus, no pueden evaluarse sesgos de género, idioma o dominio.
- Tokens especiales nuevos: requieren configuración manual del tokenizer y del servidor de inferencia; un uso incorrecto puede degradar la salida o producir tokens literales.
- Licencia apache-2.0: permite uso comercial, pero el modelo base y los datos privados podrían imponer condiciones adicionales no reflejadas en la model card.
- Cero adopción: sin descargas ni likes, no hay retroalimentación de la comunidad sobre su comportamiento en producción.
- Repositorio de 16,4 GB: incluye pesos en bf16; la conversión a GGUF o cuantizaciones no está publicada por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mseo3/klear8b-planfmt-sftg-v3orth-mixctx1-b36-brewster-s100
- Modelo base: https://huggingface.co/Kwai-Klear/Klear-Reasoner-8B-SFT
- Dataset de entrenamiento (privado, referencia): mseo3/klear8b-planfmt-revmask-sft
