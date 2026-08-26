# dvader13/olmo2-1b-rlfinal-s1-2517b

## Resumen

El repositorio `dvader13/olmo2-1b-rlfinal-s1-2517b` contiene un checkpoint intermedio de entrenamiento, no un modelo listo para inferencia. Se trata del estado final de un proceso de *reinforcement learning* (RL) aplicado sobre el modelo base OLMo-2-1B de AI2, en su etapa de pretraining correspondiente a `stage1-step1200000-tokens2517B` (es decir, 2517 mil millones de tokens procesados). El autor del repositorio, `dvader13`, publica este checkpoint con el objetivo de permitir reanudar el entrenamiento desde ese punto exacto, no de servir como artefacto de despliegue.

El checkpoint incluye el estado completo del entrenamiento: pesos en fp32, optimizador, scheduler, estado del generador de números aleatorios (RNG) y del dataloader. Esto significa que es resumible, pero no exportable directamente a formatos de inferencia como safetensors o GGUF. La licencia es Apache 2.0, lo que facilita su uso en investigación y desarrollo.

La relevancia de este repositorio radica en su valor para la reproducibilidad científica: permite auditar o continuar el entrenamiento de un modelo de 1B de parámetros con un pipeline de RL, algo poco común en la comunidad open source. Sin embargo, cualquier persona que busque un modelo utilizable deberá partir de los checkpoints de inferencia oficiales de OLMo-2-1B, no de este.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-2-1B) |
| Parametros totales | 1.2B (aproximado, segun la familia OLMo-2-1B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base OLMo-2-1B soporta 4096 tokens) |
| Tipos de cuantizacion | No disponible (checkpoint en fp32, sin cuantizaciones) |
| Idiomas soportados | No disponible (el modelo base esta entrenado principalmente con datos en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (estado de entrenamiento completo, no safetensors) |

## Arquitectura y entrenamiento

El modelo base es OLMo-2-1B, un transformer decoder-only de 1.2B parametros desarrollado por el Allen Institute for AI (Ai2). Este modelo fue pretrained desde cero con un dataset completamente abierto compuesto por texto web curado, codigo, libros y texto cientifico, deduplicado y filtrado por calidad. La etapa de pretraining correspondiente a este checkpoint es `stage1-step1200000-tokens2517B`, lo que indica que se entrenaron 2517 mil millones de tokens en total.

El checkpoint aqui publicado corresponde al paso 5000 de una fase de *reinforcement learning* (RL) posterior al pretraining. Aunque no se especifica el algoritmo de RL exacto (probablemente RLVR, como en OLMo-2-1B-RLVR1), la publicacion del estado completo del optimizador y del scheduler indica que se trata de un entrenamiento continuable, no de un modelo finalizado. La ausencia de un export de inferencia confirma que no se realizo ninguna conversion a formatos de uso comun.

## Capacidades

Al ser un checkpoint de entrenamiento, no se puede evaluar directamente sus capacidades de inferencia. Sin embargo, se puede inferir que, al estar basado en OLMo-2-1B, hereda las capacidades del modelo base:

- Generacion de texto coherente en inglese.
- Razonamiento basico y respuesta a preguntas.
- Capacidad de seguir instrucciones (si el RL se aplico sobre un dataset de chat).
- No se dispone de informacion sobre tool calling, vision o audio.

Es importante destacar que este checkpoint no es util para inferencia directa; para ello hay que convertir los pesos o usar los modelos oficiales de Ai2 (como `allenai/OLMo-2-0425-1B`).

## Casos de uso

Este repositorio no esta pensado para casos de uso en produccion. Sus aplicaciones practicas se limitan al ambito de la investigacion y el desarrollo de modelos:

- **Investigacion en RL**: permite reproducir o continuar experimentos de reinforcement learning sobre un modelo de 1B parametros con datos abiertos.
- **Auditoria de entrenamiento**: al incluir el estado completo del optimizador y scheduler, se puede analizar el proceso de RL paso a paso.
- **Desarrollo de tecnicas de RL**: util para investigadores que quieren probar nuevos algoritmos de RL sin partir de cero.
- **Estudio de la escalabilidad del RL**: comparar el comportamiento del RL en modelos pequenos (1B) frente a modelos mas grandes.
- **Educacion**: como ejemplo didactico de como se guarda y reanuda un entrenamiento de RL en PyTorch.

No se recomienda usar este checkpoint para tareas de inferencia, chat o generacion de codigo, ya que no es un export de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint especifico en la informacion disponible. El modelo base OLMo-2-1B cuenta con evaluaciones publicas en el reporte tecnico de OLMo 2, pero no se pueden atribuir a este checkpoint de RL sin datos concretos.

## Requisitos de hardware

- Este checkpoint no es para inferencia, sino para continuar el entrenamiento.
- Para reanudar el entrenamiento se necesitaria una GPU con al menos 16 GB de VRAM para almacenar los pesos en fp32 y el estado del optimizador (que ocupa mas que los pesos).
- No se recomienda su uso en GPU de consumo como RTX 4090 para entrenamiento completo; una A100 o H100 seria adecuada.
- No se puede desplegar con vLLM, llama.cpp o Ollama porque no hay pesos de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| `dvader13/olmo2-1b-rlfinal-s1-2517b` (este) | 1.2B | no disponible | Apache 2.0 | PyTorch checkpoint |
| `allenai/OLMo-2-0425-1B` | 1.2B | 4096 | Apache 2.0 | safetensors |
| `allenai/OLMo-2-0425-1B-RLVR1` | 1.2B | 4096 | Apache 2.0 | safetensors |

La diferencia principal es que los modelos oficiales de Ai2 son exportaciones de inferencia, mientras que este checkpoint es un artefacto de entrenamiento. El modelo RLVR1 de Ai2 ya ha pasado por un pipeline de RL similar (RLVR) y esta listo para uso, mientras que este no.

## Limitaciones y advertencias

- **No es un modelo de inferencia**: no se puede cargar con librerias como transformers o llama.cpp.
- **Sesgos y alucinaciones**: al ser un checkpoint de RL no se puede evaluar, pero el modelo base OLMo-2-1B puede presentar sesgos de los datos de entrenamiento (en inglese, principalmente).
- **Idiomas**: no se ha verificado el soporte de otros idiomas distintos del ingles.
- **Licencia**: Apache 2.0 permite uso comercial, pero el checkpoint no es util para produccion.
- **Caveat de produccion**: cualquier uso de este checkpoint fuera del entrenamiento no es recomendable.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/dvader13/olmo2-1b-rlfinal-s1-2517b
- Modelo base de Ai2: https://huggingface.co/allenai/OLMo-2-0425-1B
- Variante RL de Ai2: https://huggingface.co/allenai/OLMo-2-0425-1B-RLVR1
- Pagina oficial de OLMo: https://allenai.org/olmo2
- Repositorio de entrenamiento de OLMo: https://github.com/allenai/OLMo
