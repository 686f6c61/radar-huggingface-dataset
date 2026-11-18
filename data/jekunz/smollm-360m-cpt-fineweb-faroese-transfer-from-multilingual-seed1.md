# jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-multilingual-seed1

## Resumen

El modelo `jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-multilingual-seed1` es un ajuste fino del modelo base `HuggingFaceTB/SmolLM2-360M-Instruct` orientado a la generación de texto en feroés (`fo`). Lo desarrolla el usuario independiente `jekunz` como parte de su investigación sobre transferencia lingüística entre lenguas nórdicas, y se distribuye con licencia Apache 2.0. El modelo parte de la arquitectura Llama de SmolLM2, con 361.821.120 parámetros totales, y se ha entrenado mediante preentrenamiento continuado (continued pre-training, CPT) sobre el corpus FineWeb-2.

La estrategia de entrenamiento es deliberadamente en dos fases: primero se ajusta de forma conjunta sobre las porciones en danés, islandés, noruego bokmål, noruego nynorsk y sueco de FineWeb-2, y después se especializa sobre la porción en feroés. La hipótesis subyacente es que el transfer desde lenguas nórdicas mejor representadas en los datos de preentrenamiento originales facilita la adaptación al feroés, un idioma con recursos escasos. Este repositorio corresponde a la semilla 1 de tres ejecuciones con la misma configuración.

Es relevante ahora porque ejemplifica una práctica habitual en la comunidad open source: reutilizar modelos pequeños ya instruidos (360M) y adaptarlos a idiomas de bajos recursos con presupuestos de cómputo mínimos (una sola A100 de 40 GB). No obstante, el autor advierte explícitamente de que el modelo está pensado para su investigación y no ha sido evaluado de forma amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (derivada de SmolLM2-360M-Instruct) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | feroés (`fo`) como objetivo; entrenamiento auxiliar en danés, islandés, noruego bokmål, noruego nynorsk y sueco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de SmolLM2-360M-Instruct, un transformer decoder-only de tipo Llama con 361,8 millones de parámetros. No introduce modificaciones arquitectónicas propias: el trabajo consiste en preentrenamiento continuado (CPT) sobre el modelo ya instruido, seguido de una especialización lingüística. El contexto máximo manejado durante el entrenamiento es de 2048 tokens.

El entrenamiento se realizó en dos etapas sobre el corpus FineWeb-2: una primera época sobre los datos conjuntos de danés, islandés, noruego bokmål, noruego nynorsk y sueco, y cinco épocas adicionales sobre la porción en feroés. La configuración documentada incluye learning rate de 5e-4, scheduler coseno, warmup ratio de 0,05, batch size de 8 con 32 pasos de acumulación de gradiente (batch efectivo de 256), y ejecución en una única GPU A100 de 40 GB. La semilla empleada es 1. No se documentan fases de RLHF o DPO posteriores, ni la composición exacta en número de tokens del corpus de entrenamiento.

## Capacidades

- Generación de texto en feroés, aprovechando el transfer desde lenguas nórdicas mejor representadas.
- Conversación multi-turno heredada del modelo base instruido, aunque no se ha verificado su calidad tras el CPT.
- Razonamiento básico y respuesta a instrucciones, procedentes de SmolLM2-360M-Instruct, sin evaluación específica posterior.
- Capacidad multilingüe residual del modelo base (SmolLM2 está entrenado en varios idiomas), aunque la ficha solo declara feroés como idioma soportado.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Experimentación académica en transfer lingüístico: el modelo sirve como punto de partida para estudiar cómo el preentrenamiento continuado en lenguas nórdicas relacionadas mejora la adaptación al feroés, comparando con las otras dos semillas de la misma configuración.
- Generación de texto en feroés para prototipos: útil para producir borradores o completar textos en un idioma con pocos modelos disponibles, aceptando que la calidad no está validada.
- Investigación sobre datos de FineWeb-2: permite analizar el efecto de mezclar subconjuntos lingüísticos de un corpus web masivo en modelos pequeños.
- Reproducibilidad de recetas de bajo coste: la configuración (una A100 de 40 GB, batch efectivo de 256) es replicable por grupos con recursos limitados que quieran adaptar modelos de 360M a idiomas de bajos recursos.
- Base para ajuste fino posterior: al estar construido sobre un modelo instruido, puede servir como inicialización para tareas concretas en feroés (clasificación, resumen, diálogo) con datasets pequeños.
- Estudio de semillas y estabilidad del entrenamiento: al existir tres ejecuciones con la misma configuración y distinta semilla, es útil para medir la varianza en resultados de CPT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 1,4 GB solo para pesos, más overhead de activaciones y caché KV.
- VRAM estimada en fp16/bf16: en torno a 0,7 GB para pesos, más overhead; cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; para entrenamiento, el autor usó una A100 de 40 GB.
- Cabe en GPU consumer: sí, con margen amplio, incluso en GPUs de gama baja.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference`), endpoints compatibles; no se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-multilingual-seed1 | 361,8 M | 2048 | feroés (con transfer nórdico) | Apache 2.0 | Hugging Face |
| HuggingFaceTB/SmolLM2-360M-Instruct | 361,8 M | 2048 (no confirmado en esta ficha) | multilingüe | Apache 2.0 | Hugging Face |
| Otras semillas del mismo autor (seed 2 y seed 3) | 361,8 M | 2048 | feroés | Apache 2.0 | Hugging Face (según el autor) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor indica que el modelo está pensado para su investigación y no ha sido evaluado de forma amplia; no debe asumirse calidad en producción.
- Riesgo elevado de alucinación y de degradación de las capacidades instruidas originales tras cinco épocas de CPT sobre feroés.
- El contexto está limitado a 2048 tokens, insuficiente para tareas de contexto largo.
- La cobertura idiomática declarada es únicamente feroés; el comportamiento en castellano u otros idiomas no está garantizado y probablemente degradado respecto al modelo base.
- Posibles sesgos heredados de FineWeb-2 (corpus web) y del modelo base SmolLM2, sin documentación de mitigación.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación hace arriesgado desplegarlo en producción sin validación propia.
- Solo se publica la semilla 1; las otras dos ejecuciones pueden dar resultados distintos, lo que refleja varianza en el entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-multilingual-seed1
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la búsqueda web.
