# jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-multilingual-seed3

## Resumen

El modelo `jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-multilingual-seed3` es un adaptador LoRA sobre `HuggingFaceTB/SmolLM2-360M-Instruct`, desarrollado por el usuario jekunz con fines de investigación. El objetivo es la adaptación al feroés (código ISO `fo`) mediante una estrategia de transferencia desde un ajuste previo conjunto sobre lenguas germánicas nórdicas (danés, islandés, noruego bokmål, noruego nynorsk y sueco). Se trata, por tanto, de un experimento de adaptación lingüística de bajo recurso sobre un modelo pequeño.

El modelo base, SmolLM2-360M-Instruct, es un transformer decoder-only de 360 millones de parámetros desarrollado por Hugging Face, con licencia Apache 2.0, diseñado para generación de texto y conversación en entornos con recursos limitados. Este adaptador no modifica la arquitectura ni el tamaño del modelo base: el resultado es un conjunto de pesos LoRA que debe fusionarse o cargarse junto con el modelo original.

La relevancia radica en su enfoque metodológico: el ajuste en dos fases (primero sobre un conjunto multilingüe de lenguas nórdicas emparentadas y después sobre feroés) busca aprovechar el transfer positivo entre lenguas cercanas para mejorar el rendimiento en un idioma con pocos datos disponibles. El autor indica explícitamente que el modelo no ha sido evaluado de forma amplia y que está destinado únicamente a su investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-360M-Instruct) con adaptador LoRA |
| Parametros totales | 360M en el modelo base; el adaptador LoRA añade un número de parámetros no especificado en la información disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima usada durante el entrenamiento del adaptador); la del modelo base no se especifica en la información proporcionada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | feroés (`fo`) como objetivo del ajuste; el modelo base es multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre SmolLM2-360M-Instruct, un transformer decoder-only de 360 millones de parámetros. La configuración LoRA empleada es de rango 256 y alpha 512, con módulos objetivo `up_proj`, `down_proj`, `gate_proj` y `o_proj`. Es decir, se adaptan las proyecciones de las capas feed-forward y la proyección de salida de la atención, lo que constituye una configuración relativamente amplia en cuanto a rango para un modelo de este tamaño.

El entrenamiento se realizó en dos fases sobre el dataset `HuggingFaceFW/fineweb-2`: primero una época sobre los subconjuntos de danés, islandés, noruego bokmål, noruego nynorsk y sueco de forma conjunta, y después cinco épocas sobre el subconjunto de feroés. Se usó una tasa de aprendizaje de 8e-4 con scheduler coseno, warmup ratio de 0,05, batch size de 8 con acumulación de gradientes de 32 pasos (batch efectivo de 256), longitud máxima de contexto de 2048 tokens, semilla 3 (una de tres semillas para esta configuración) y una única GPU A100 de 40 GB. No se documentan en la información disponible el número total de tokens procesados, la composición exacta del dataset ni la aplicación de RLHF o DPO.

## Capacidades

- Generación de texto y conversación en feroés, idioma objetivo del ajuste.
- Generación de texto en el resto de idiomas cubiertos por el modelo base (SmolLM2-360M-Instruct es multilingüe), aunque el ajuste puede haber alterado el equilibrio original.
- Razonamiento básico y respuesta a instrucciones heredados del modelo base Instruct.
- Capacidad de ejecución en entornos con recursos muy limitados por el reducido tamaño del modelo base.
- Soporte de tool calling o function calling: no documentado en la información disponible para este adaptador.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Experimentación académica en adaptación de lenguas de bajo recurso: el adaptador sirve como punto de partida para estudiar el transfer entre lenguas nórdicas y el feroés, comparando con las otras dos semillas de la misma configuración.
- Generación de texto asistida en feroés para prototipos: dado el reducido tamaño del modelo, puede usarse para generar borradores o completar textos en feroés en entornos de prueba, siempre con revisión humana.
- Investigación sobre olvido catastrófico: al ajustar cinco épocas sobre feroés tras una fase multilingüe, el modelo permite medir cuánto se degrada el rendimiento en las lenguas de la primera fase.
- Evaluación de configuraciones LoRA: el rango 256 y los módulos objetivo elegidos permiten comparar con otras configuraciones sobre el mismo modelo base en estudios de ablación.
- Despliegue en dispositivos de borde para pruebas: con 360M parámetros, el modelo fusionado puede ejecutarse en CPU o GPU de gama baja para demos de generación de texto en feroés.
- Reproducibilidad de experimentos: la semilla documentada (3) y los hiperparámetros detallados facilitan la replicación del ajuste en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo "has not been evaluated more broadly yet".

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en fp16 ocupa aproximadamente 0,7 GB; en cuantización de 8 bits, alrededor de 0,4 GB; en 4 bits, alrededor de 0,2 GB (estimaciones para el modelo base, no confirmadas para el adaptador fusionado en la información disponible).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para el modelo fusionado en fp16; el entrenamiento del adaptador se realizó en una A100 de 40 GB.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas con suficiente memoria compartida, dado el reducido tamaño.
- Opciones de despliegue: el adaptador es compatible con la librería PEFT; para inferencia puede fusionarse con el modelo base y desplegarse con transformers, llama.cpp (previa conversión a GGUF), Ollama o vLLM, aunque no se documentan conversiones ni recetas específicas en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-multilingual-seed3 | 360M (base) + LoRA | 2048 (entrenamiento) | Apache 2.0 | Hugging Face | Adaptador LoRA para feroés, sin evaluación publicada |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360M | no disponible en la información proporcionada | Apache 2.0 | Hugging Face | Modelo base multilingüe con instrucciones |
| Otras semillas de la misma configuración (seed 1, seed 2) | 360M (base) + LoRA | 2048 (entrenamiento) | Apache 2.0 | Hugging Face (según el autor) | Variantes del mismo experimento con distinta semilla |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor indica que el modelo está destinado a su investigación y no ha sido evaluado de forma amplia; no debe usarse en producción sin una evaluación previa.
- Riesgo de alucinación inherente a un modelo de 360M parámetros, especialmente en un idioma de bajos recursos como el feroés.
- El ajuste de cinco épocas sobre feroés tras una fase multilingüe puede provocar olvido catastrófico de las lenguas de la primera fase (danés, islandés, noruego y sueco).
- La longitud de contexto usada en el entrenamiento es de 2048 tokens; secuencias más largas pueden degradar la calidad.
- Solo se documenta el feroés como idioma objetivo; el comportamiento en otros idiomas no está verificado.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un adaptador sobre un modelo base, deben respetarse también las condiciones del modelo base.
- No se documentan sesgos específicos, pero al entrenarse sobre FineWeb-2 (datos web) puede heredar sesgos presentes en ese corpus.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-multilingual-seed3)
- [Modelo base: HuggingFaceTB/SmolLM2-360M-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct)
- [Dataset: HuggingFaceFW/fineweb-2](https://huggingface.co/datasets/HuggingFaceFW/fineweb-2)
- [Librería PEFT](https://github.com/huggingface/peft)
