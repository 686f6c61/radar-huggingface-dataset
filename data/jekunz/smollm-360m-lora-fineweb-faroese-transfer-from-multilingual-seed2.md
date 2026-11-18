# jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-multilingual-seed2

## Resumen

El modelo `jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-multilingual-seed2` es un adaptador LoRA (PEFT) construido sobre `HuggingFaceTB/SmolLM2-360M-Instruct`, el modelo de lenguaje pequeno de Hugging Face. El autor, identificado como `jekunz`, lo entrena con un esquema de transferencia linguistica en dos fases: primero sobre el subconjunto conjunto de danes, islandes, noruego bokmal, noruego nynorsk y sueco de FineWeb-2, y despues sobre el subconjunto en feroes del mismo corpus. El objetivo es mejorar el modelado del feroes, un idioma de bajos recursos, aprovechando el parentesco con las lenguas nordicas mejor representadas en el corpus.

El modelo base SmolLM2-360M-Instruct es un transformer decoder-only de 360 millones de parametros, disenado para tareas de generacion de texto y conversacion en entornos con recursos limitados. Este adaptador no modifica el modelo base: se distribuye como pesos LoRA en formato safetensors, con rango 256 y alpha 512, aplicados sobre las proyecciones `up_proj`, `down_proj`, `gate_proj` y `o_proj` de las capas del transformer.

Es relevante porque documenta una estrategia reproducible de adaptacion a idiomas de bajos recursos mediante transferencia desde lenguas proximas, con hiperparametros explicitos y tres semillas de entrenamiento (este repositorio corresponde a la semilla 2). No obstante, el propio autor indica que el modelo es de uso interno para investigacion y que no ha sido evaluado de forma amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-360M-Instruct) con adaptador LoRA |
| Parametros totales | 360M (modelo base) + parametros del adaptador LoRA (no cuantificados en la informacion disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion, pero no se especifica) |
| Idiomas soportados | Feroes (`fo`); entrenado con transferencia desde danes, islandes, noruego bokmal, noruego nynorsk y sueco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base SmolLM2-360M-Instruct |
| Rango LoRA | 256 |
| Alpha LoRA | 512 |
| Modulos objetivo | `up_proj`, `down_proj`, `gate_proj`, `o_proj` |
| Tamano del repositorio | 0,4 GB |
| Libreria | PEFT |

## Arquitectura y entrenamiento

El modelo base SmolLM2-360M-Instruct es un transformer decoder-only de 360 millones de parametros con atencion causal estandar y entrenamiento previo sobre un corpus multilingue de gran escala, seguido de ajuste por instrucciones. Sobre el se aplica un adaptador LoRA de rango 256 y alpha 512 en las proyecciones de atencion de salida (`o_proj`) y en las proyecciones del bloque feed-forward (`up_proj`, `down_proj`, `gate_proj`), lo que permite adaptar el modelo sin reentrenar los pesos completos.

El entrenamiento se realiza en dos fases sobre FineWeb-2: una primera epoca sobre el subconjunto conjunto de danes, islandes, noruego bokmal, noruego nynorsk y sueco, y cinco epocas adicionales sobre el subconjunto en feroes. Se usa tasa de aprendizaje 8e-4 con scheduler coseno, warmup ratio 0,05, batch size 8, acumulacion de gradientes de 32 pasos (batch efectivo 256) y una unica GPU A100 de 40 GB. La longitud maxima de contexto durante el entrenamiento es de 2048 tokens y la semilla es 2 (una de tres semillas para esta configuracion). No se documenta el numero total de tokens procesados ni la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto en feroes, con capacidad de continuar y completar textos en ese idioma.
- Conversacion multi-turno heredada del ajuste por instrucciones del modelo base SmolLM2-360M-Instruct.
- Modelado de lenguaje y ajuste a dominio sobre textos de FineWeb-2 en lenguas nordicas.
- Capacidad de transferencia desde lenguas nordicas mejor representadas (danes, islandes, noruego, sueco) hacia el feroes.
- Soporte de tool calling y function calling: no documentado especificamente para este adaptador; el modelo base lo soporta parcialmente, pero no hay confirmacion en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el tamano del modelo (360M) limita estas capacidades.
- Capacidades multilingues: el adaptador esta orientado a feroes; el modelo base conserva su multilingueismo, pero no se ha evaluado el impacto del ajuste sobre otros idiomas.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Generacion y aumento de datos en feroes: el adaptador puede generar textos sinteticos en feroes para ampliar corpus de entrenamiento de modelos mayores, aprovechando el conocimiento transferido desde las lenguas nordicas del corpus FineWeb-2.
- Prototipado de asistentes conversacionales en feroes: al heredar el ajuste por instrucciones del modelo base, permite construir demos de chat en feroes con un coste computacional muy bajo (360M parametros).
- Correccion y normalizacion de texto en feroes: el modelo puede emplearse para tareas de reescritura, puntuacion y normalizacion ortografica en corpus de feroes, aunque sin garantias de calidad por la falta de evaluacion.
- Investigacion en transferencia linguistica: sirve como caso de estudio reproducible para analizar como el preentrenamiento en lenguas nordicas proximas mejora el modelado de un idioma de bajos recursos como el feroes.
- Experimentos de destilacion o adaptacion de modelos pequenos: el adaptador puede usarse como punto de partida para ajustes posteriores en tareas especificas en feroes sobre SmolLM2-360M.
- Educacion y divulgacion sobre PEFT: el repositorio documenta hiperparametros completos (rango, alpha, modulos objetivo, scheduler, batch efectivo), lo que lo hace util como ejemplo didactico de configuracion LoRA.
- Despliegue en entornos con recursos muy limitados: con 360M parametros y un adaptador de 0,4 GB, puede ejecutarse en CPU o en GPUs de gama baja para tareas de generacion de texto en feroes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo "has not been evaluated more broadly yet".

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en FP16 ocupa aproximadamente 0,7 GB; con el adaptador LoRA (0,4 GB en el repositorio) el total ronda 1,1 GB en precision completa. En cuantizacion de 4 bits, el modelo base puede ocupar menos de 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP16; A100, H100 o RTX 4090 no son necesarias para inferencia, solo se uso una A100 40 GB para el entrenamiento.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4060, etc.) e incluso en CPU.
- Opciones de despliegue: transformers con PEFT (carga del adaptador sobre el modelo base), llama.cpp y Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF, vLLM para servir el modelo fusionado, TGI si se fusiona previamente.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera un throughput alto en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-multilingual-seed2 | 360M (base) + LoRA | 2048 (entrenamiento) | Feroes (con transferencia nordica) | Apache 2.0 | Hugging Face, 0 descargas |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360M | 8192 (modelo base) | Multilingue | Apache 2.0 | Hugging Face, ampliamente usado |
| Adaptadores LoRA equivalentes para feroes sobre modelos mayores | no disponible | no disponible | Feroes | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- El autor indica que el modelo es de uso interno para investigacion y que no ha sido evaluado de forma amplia; no hay garantias de calidad en produccion.
- Riesgo de alucinacion: al ser un modelo de 360M parametros, la generacion de hechos es especialmente propensa a errores, agravado por el escaso volumen de datos en feroes.
- Sesgos conocidos: no documentados; el modelo hereda los sesgos del corpus FineWeb-2 y del modelo base SmolLM2, no evaluados en este adaptador.
- Limitaciones de contexto: la longitud maxima usada en entrenamiento es de 2048 tokens, inferior al contexto nativo del modelo base (8192 tokens), lo que puede degradar el rendimiento en secuencias largas.
- Limitaciones de idioma: el adaptador esta orientado exclusivamente al feroes; el ajuste puede degradar el rendimiento del modelo base en otros idiomas, algo no evaluado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y el modelo no ha sido validado para produccion.
- Caveat importante: el repositorio contiene solo el adaptador LoRA, no los pesos completos; es necesario cargar el modelo base SmolLM2-360M-Instruct y aplicar el adaptador con PEFT, o fusionarlos antes de desplegar.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-multilingual-seed2
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Libreria PEFT: https://github.com/huggingface/peft
- Paper de SmolLM2: no disponible en la informacion proporcionada
- Blog o demo del autor: no disponible en la informacion proporcionada
