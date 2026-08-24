# blueholez/exaone-nsmc-lora-merged-bluehoez

## Resumen

El modelo `blueholez/exaone-nsmc-lora-merged-bluehoez` es un ajuste fino mediante LoRA sobre un modelo base de la familia EXAONE de LG AI Research, especializado en el análisis de sentimiento de reseñas de películas en coreano. El nombre "nsmc" hace referencia al dataset NSMC (Naver Sentiment Movie Corpus), un corpus ampliamente utilizado para tareas de clasificación de sentimiento en coreano. El autor, blueholez, ha fusionado los pesos del LoRA con el modelo base, dando como resultado un modelo listo para inferencia con 1.279.391.488 parámetros (aproximadamente 1,28 mil millones).

Este modelo resulta relevante porque demuestra un flujo práctico de fine-tuning y fusión de LoRA sobre modelos EXAONE, una familia de modelos de lenguaje de código abierto desarrollada por LG AI Research. Al estar basado en EXAONE 4.x, hereda su arquitectura transformer y su capacidad de generación de texto conversacional, aunque adaptado específicamente a la tarea de análisis de sentimiento en coreano. La disponibilidad de una versión GGUF adicional sugiere que puede desplegarse en entornos con recursos limitados mediante llama.cpp u Ollama.

La ficha se basa únicamente en la información pública disponible en HuggingFace y en los resultados de búsqueda web. La model card original es una plantilla genérica sin datos técnicos detallados, por lo que muchas especificaciones se indican como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer decoder, basado en EXAONE 4.x) |
| Parametros totales | 1.279.391.488 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (existe una version GGUF, pero sin detalle de cuantizaciones) |
| Idiomas soportados | no disponible (probablemente coreano, por el dataset NSMC) |
| Licencia | no disponible |
| Formato de pesos | safetensors (tambien disponible en GGUF) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo. Por el tag `exaone4` y la referencia al repositorio de EXAONE-4.5, se infiere que el modelo base pertenece a la familia EXAONE de LG AI Research, que utiliza una arquitectura transformer decoder estándar. El proceso de entrenamiento consistió en un fine-tuning con LoRA (Low-Rank Adaptation) sobre el dataset NSMC, seguido de la fusión de los pesos del adaptador con el modelo base. No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto en coreano, con especialización en análisis de sentimiento de reseñas de películas.
- Conversación multi-turno, heredada del modelo base EXAONE.
- Clasificación de sentimiento (positivo/negativo) en textos cortos, gracias al fine-tuning con NSMC.
- No se ha confirmado soporte para tool calling, function calling, agentes o razonamiento multi-paso.
- No se ha confirmado capacidad multilingüe; el dataset de entrenamiento es exclusivamente coreano.

## Casos de uso

- Analisis de sentimiento de reseñas de peliculas en coreano: el modelo puede clasificar criticas como positivas o negativas, util para plataformas de streaming o agregadores de opiniones.
- Moderacion de comentarios en foros o redes sociales coreanas: permite detectar opiniones negativas o toxicas en tiempo real.
- Investigacion academica en procesamiento de lenguaje natural: sirve como punto de partida para experimentos de fine-tuning con LoRA sobre modelos EXAONE.
- Desarrollo de chatbots conversacionales en coreano: aunque no esta optimizado para dialogos abiertos, puede integrarse en sistemas que requieran comprension de sentimiento.
- Prototipado rapido de clasificadores de texto: al tener solo 1,28B parametros, es adecuado para entornos con recursos limitados.
- Educacion y demostracion de tecnicas de adaptacion de modelos: el flujo LoRA + merge es un ejemplo didactico de como especializar un modelo generico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras metricas estandar. Tampoco se han encontrado comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,28B parametros, en fp16 se necesitan aproximadamente 2,6 GB de VRAM; en int8, alrededor de 1,3 GB; en cuantizacion de 4 bits, menos de 1 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, RTX 4090) puede ejecutar el modelo sin problemas.
- Si cabe en consumer GPU: si, es un modelo ligero que cabe en la mayoria de GPUs modernas.
- Opciones de despliegue: al estar disponible en formato safetensors, puede usarse con transformers y vLLM; la version GGUF permite su uso con llama.cpp, Ollama y otros motores compatibles.
- Latencia y throughput: no se han publicado datos concretos, pero por su tamano se espera una latencia baja (del orden de decenas de milisegundos por token en GPUs consumer).

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de la misma categoria. El modelo base EXAONE 4.5 tiene versiones de 7.8B y 24B parametros, pero este ajuste con LoRA reduce el tamano a 1,28B, lo que lo hace incomparable directamente con los modelos originales. No se han encontrado otros modelos fine-tuneados con NSMC sobre EXAONE en la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha documentado ningun sesgo especifico, pero al entrenarse con un corpus de reseñas de peliculas, puede reflejar los sesgos presentes en ese dataset (por ejemplo, preferencias de genero cinematografico o demograficas).
- Riesgo de alucinacion: al ser un modelo pequeno, puede generar respuestas incoherentes o inventar informacion, especialmente fuera del dominio de analisis de sentimiento.
- Limitaciones de contexto: no se conoce la longitud de contexto, pero por el tamano del modelo es probable que sea limitada (tipicamente 2048 o 4096 tokens).
- Limitaciones de idioma: el modelo esta especializado en coreano; su rendimiento en otros idiomas probablemente sea deficiente.
- Restricciones de licencia: la licencia no esta disponible, por lo que se desconoce si permite uso comercial. Se recomienda contactar con el autor antes de utilizarlo en produccion.
- Caveat para produccion: al ser un modelo de demostracion o investigacion, no se garantiza su robustez en entornos reales. Se recomienda evaluar su rendimiento en el caso de uso concreto antes de desplegarlo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/blueholez/exaone-nsmc-lora-merged-bluehoez)
- [Version GGUF del modelo](https://huggingface.co/blueholez/exaone-nsmc-lora-blueholez-GGUF)
- [Repositorio de EXAONE-4.5 en GitHub](https://github.com/LG-AI-EXAONE/EXAONE-4.5)
- [Guia de model merging de invoke-training](https://invoke-ai.github.io/invoke-training/guides/model_merge/)
- [Repositorio de mergekit](https://github.com/arcee-ai/mergekit)
